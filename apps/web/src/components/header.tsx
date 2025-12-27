"use client"

import type { Route } from 'next';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export function Header() {

  return (
    <div>
      <div className='h-250 sticky top-0 bg-white z-50'>
        <h1 className="absolute text-7xl font-bold left-1/2 -translate-x-1/2 top-15">IGG TECHNIK</h1>
        <div className='absolute bottom-1/2 left-1/2 -translate-x-1/2'>
          <Link href={"/sign-in" as Route}>
        <Button className="rounded text-4xl border-25 border-gray-100 shadow-md hover:cursor-pointer hover:shadow-xl text-black">
          Anmelden
        </Button>
         </Link>
        </div>
        <div className='absolute bottom-1/4 left-1/2 -translate-x-1/2'>
        <Link href={"#calendar"}>
         <p className='text-5xl rounded-xl shadow-xl'>Kalender</p>
         <ArrowDown size={100} className='absolute translate-x-1/2 mt-10'/>
        </Link>
        </div>
      </div>
    </div>
  )
}
