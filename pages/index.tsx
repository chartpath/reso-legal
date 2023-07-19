import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { SearchDialog } from '@/components/SearchDialog'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Reso Legal</title>
        <meta name="description" content="Bridging the gap in access to legal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className="items-center justify-center text-center">
          <Image src={'/logo.png'} width="300" height="99" alt="logo" />
          <h5 className="pt-10">Bridging the gap in access to legal information</h5>
        </div>
        <div className={styles.center}>
          <SearchDialog />
        </div>

        <div className="py-8 w-3/4 flex items-center justify-center space-x-6">
          <p className="text-sm text-slate-400 mr-2">
            Disclaimer: This site provides general information only and is not to be used as legal
            advice for specific legal problems. If you need legal help contact your local legal aid
            office or a lawyer. Every reasonable effort has been made to ensure that the information
            presented on this website is current and accurate. At any time, some details may not yet
            reflect recent changes. Links from this site to other websites are provided for the
            convenience of users. Reso Legal does not create or maintain these websites and does not
            accept any responsibility for their content and accuracy. Reso Legal will not be liable
            for any loss or damages of any nature, either direct or indirect, arising from use of
            the information provided on this website or any website to which this site is linked.
          </p>
        </div>

        {/* <div className="py-8 w-full flex items-center justify-center space-x-6">
          <div className="opacity-75 transition hover:opacity-100 cursor-pointer">
            <Link href="https://supabase.com" className="flex items-center justify-center">
              <p className="text-base mr-2">Built by Supabase</p>
              <Image src={'/supabase.svg'} width="20" height="20" alt="Supabase logo" />
            </Link>
          </div>
          <div className="border-l border-gray-300 w-1 h-4" />
          <div className="flex items-center justify-center space-x-4">
            <div className="opacity-75 transition hover:opacity-100 cursor-pointer">
              <Link
                href="https://github.com/supabase/supabase"
                className="flex items-center justify-center"
              >
                <Image src={'/github.svg'} width="20" height="20" alt="Github logo" />
              </Link>
            </div>
            <div className="opacity-75 transition hover:opacity-100 cursor-pointer">
              <Link
                href="https://twitter.com/supabase"
                className="flex items-center justify-center"
              >
                <Image src={'/twitter.svg'} width="20" height="20" alt="Twitter logo" />
              </Link>
            </div>
          </div>
        </div> */}
      </main>
    </>
  )
}
