"use client"

import type { Route } from 'next';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowDown, CircleQuestionMark } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export function Header() {

  return (
    <div className='relative'>
      <div className='h-250 sticky top-0 bg-white z-50 dark:bg-black'>
        <h1 className="absolute text-7xl font-bold left-1/2 -translate-x-1/2 top-15 text-black dark:text-white">IGG TECHNIK</h1>
        <h2 className='absolute text-xl font-sans left-1/2 -translate-x-1/2 lg:top-47 top-50 text-black dark:text-white sm:top-53 dark:sm:top-53 dark:top-50 dark:lg:top-47'>Das ist die neue IGG Technik Website. Ihr könnt euch über den <Link href={"sign-in" as Route} className='underline'>Anmelden</Link> Knopf anmelden um Events anzumelden <Tooltip> <TooltipTrigger> <CircleQuestionMark className="inline-flex align-middle ml-2"/> <TooltipContent>Falls Sie irgendwelche Fragen haben sprechen sie uns bei der Technik gerne direkt an oder schreiben sie an <strong>bittenichtvergessen@iggtechnik.de</strong></TooltipContent></TooltipTrigger> </Tooltip></h2>
        <div className='absolute bottom-1/2 left-1/2 -translate-x-1/2'>
          <Link href={"/sign-in" as Route}>
          <div className='border-3 rounded-full dark:border-white border-black hover:bg-gray-300/50'>
        <Button className="rounded-full text-6xl hover:cursor-pointer dark:text-white text-black bg-transparent mx-10 my-5">
          Anmelden
        </Button>
          </div>
         </Link>
        </div>
        <div className='absolute bottom-1/4 left-1/2 -translate-x-1/2'>
        <Link href={"#calendar"}>
        <div className='border-3 rounded-full dark:border-white border-black hover:bg-gray-300/50'>
         <p className='text-3xl my-2 mx-10 dark:text-white text-black'>Kalender</p>
        </div>
         <ArrowDown size={100} className='absolute translate-x-1/2 mt-10 text-black dark:text-white'/>
        </Link>
        </div>
      </div>
    </div>
  )
}
