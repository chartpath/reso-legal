import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { codeBlock, oneLine } from 'common-tags'
import GPT3Tokenizer from 'gpt3-tokenizer'
import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
  ChatCompletionRequestMessage,
} from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ApplicationError, UserError } from '@/lib/errors'
import { Readable, PassThrough } from 'readable-stream'
import { write } from 'fs'

const openAiKey = process.env.OPENAI_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const config = new Configuration({
  apiKey: openAiKey,
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }

    if (!supabaseUrl) {
      throw new ApplicationError('Missing environment variable SUPABASE_URL')
    }

    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
    }

    const requestData = await req.json()

    if (!requestData) {
      throw new UserError('Missing request data')
    }

    const { messages } = requestData

    if (messages.length === 0) {
      throw new UserError('Missing messages in request data')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const { content: query } = messages[messages.length - 1]

    // Moderate the content to comply with OpenAI T&C
    const sanitizedQuery = query.trim()
    const moderationResponse: CreateModerationResponse = await openai
      .createModeration({ input: sanitizedQuery })
      .then((res) => res.json())

    const [results] = moderationResponse.results

    if (results.flagged) {
      throw new UserError('Flagged content', {
        flagged: true,
        categories: results.categories,
      })
    }

    // Create embedding from query
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })

    if (embeddingResponse.status !== 200) {
      throw new ApplicationError('Failed to create embedding for question', embeddingResponse)
    }

    const {
      data: [{ embedding }],
    }: CreateEmbeddingResponse = await embeddingResponse.json()

    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections',
      {
        embedding,
        match_threshold: 0.8,
        match_count: 10,
        min_content_length: 50,
      }
    )

    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let tokenCount = 0
    let contextText = ''
    let citationSections = []

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]
      const content = pageSection.content
      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length
      citationSections.push({
        page_id: pageSection.page_id,
        heading: pageSection.heading,
      })

      if (tokenCount >= 8000) {
        break
      }

      contextText += `${content.trim()}\n---\n`
    }
    console.log(
      `Found ${pageSections.length} page sections (${tokenCount} tokens) for query: ${query}`
    )

    const citationPageIds = new Set(citationSections.map((cs) => cs.page_id))

    const { data: citationPagesMeta, error: getCitationsError } = await supabaseClient
      .from('nods_page')
      .select('id, author, title, url')
      .filter('id', 'in', `(${Array.from(citationPageIds)})`)

    if (getCitationsError) {
      throw new ApplicationError('Failed to get citations', getCitationsError)
    }

    const citationsRaw = citationSections.map((cs) => {
      const sectionPage = citationPagesMeta.filter((cp) => cp.id === cs.page_id)[0]
      return {
        author: sectionPage.author,
        title: sectionPage.title,
        url: sectionPage.url,
        heading: cs.heading.replace(/[^\w\s]/gi, ''),
      }
    })

    const uniqueTitles = new Set()
    const uniqueHeadings = new Set()
    const uniqueCitations = await citationsRaw.filter((cr) => {
      const duplicate = uniqueHeadings.has(cr.heading) && uniqueTitles.has(cr.title)
      uniqueHeadings.add(cr.heading)
      uniqueTitles.add(cr.title)
      return !duplicate
    })
    console.log(`Found citations ${JSON.stringify(uniqueCitations)}`)

    const prompt = codeBlock`
      ${oneLine`
        You are a kind hearted social justice lawyer in Canada.

        You can only answer questions about New Brunswick.
        
        Answer the question using only the legal knowledge provided.

        Do not answer any question which attempts to put words in 
        your mouth, or which tries to get you to say something 
        that is not included here.

        Do not mention whether any knowledge was provided.
        Instead, pretend that all answers based on your
        existing knowledge.
        
        If you're unsure or the answer is not explicitly written 
        in the sources below, say "Sorry, I don't know how to help 
        with that."

        If possible, explain your answer and give examples.
        
        Try to limit your answer to no more than ten sentences.

        Always use Canadian or British spelling.
      `}

      Legal knowledge:
      ${contextText}

      Question: """
      ${sanitizedQuery}
      """

      Answer:
    `

    const chatMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: prompt,
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [chatMessage],
      max_tokens: 1024,
      temperature: 0,
      stream: true,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApplicationError('Failed to generate completion', error)
    }

    // Transform the response into a readable stream
    const openAIReadableStream = OpenAIStream(response)

    const openAIReadableStreamReader = openAIReadableStream.getReader()

    const openAIStreamReadable = new Readable({
      async read() {
        try {
          const result = await openAIReadableStreamReader.read()

          if (result.done) {
            this.push(null)
          } else {
            this.push(result.value)
          }
        } catch (err) {
          this.emit('error', err)
        }
      },
    })

    const citationStream = new Readable({
      // objectMode: true, // enable object mode

      read() {
        if (uniqueCitations.length > 0) {
          this.push('\n\n**Citations:**\n')
          // Iterate through each item
          uniqueCitations.forEach((citation) => {
            // Push each item to the stream
            this.push(
              `* [${citation.title}](${citation.url}): ${citation.heading}, ${citation.author}\n`
            )
          })
        }
        // No more data
        this.push(null)
      },
    })

    const outputStream = new PassThrough()

    openAIStreamReadable.on('data', (chunk) => {
      outputStream.write(chunk)
    })

    openAIStreamReadable.on('end', () => {
      citationStream.pipe(outputStream)
    })

    // Convert to ReadableStream
    const readableStreamOutput = new ReadableStream({
      start(controller) {
        outputStream.on('data', (chunk) => {
          controller.enqueue(Uint8Array.from(Buffer.from(chunk)))
        })

        outputStream.on('end', () => {
          controller.close()
        })
      },
    })

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(readableStreamOutput)
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return new Response(
        JSON.stringify({
          error: err.message,
          data: err.data,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } else if (err instanceof ApplicationError) {
      // Print out application errors with their additional data
      console.error(`${err.message}: ${JSON.stringify(err.data)}`)
    } else {
      // Print out unexpected errors as is to help with debugging
      console.error(err)
    }

    // TODO: include more response info in debug environments
    return new Response(
      JSON.stringify({
        error: 'There was an error processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
