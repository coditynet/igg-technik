"use client"

import type { Route } from 'next';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export function Header() {

  return (
  <section
   id="home"
   className="pt-24 pb-16 min-h-screen flex items-center relative bg-center bg-fill"
   style={{
     backgroundImage:
       "url('/bg.png')",
   }}>
    <div>
      <div>
        <h1 className="fixed text-7xl font-bold left-1/2 -translate-x-1/2 top-15">IGG TECHNIK</h1>
        <div className='fixed bottom-1/2 left-1/2 -translate-x-1/2'>
          <Link href={"/sign-in" as Route}>
        <Button className="rounded text-4xl border-25 border-gray-100 shadow-md hover:cursor-pointer hover:shadow-xl text-black">
          Anmelden
        </Button>
         </Link>
        </div>
        <div className='fixed bottom-1/4 left-1/2 -translate-x-1/2'>
        <Link href={"#calendar"}>
         <p className='text-5xl border-gray-200 bg-gray-200 rounded-xl border-10'>Kalender</p>
         <ArrowDown size={100} className='fixed translate-x-1/2 mt-10'/>
        </Link>
        </div>
      </div>
    </div>
  </section>
  )
}
