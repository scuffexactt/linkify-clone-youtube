"use client";
import { cn } from '@/lib/utils'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { SignInButton, UserButton } from '@clerk/nextjs'

function Header({ isFixed = false }: { isFixed?: boolean }) {
    return (
        <header
            className={cn("bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm", isFixed && "sticky top-0 z-50"
            )}>
            <div className="max-w-7xl mx-auto px-4 xl:px-2 py-4 flex justify-between items-center">
                <Link href="/dashboard" className="text-2xl font-bold">
                    Linkify
                </Link>

                <Authenticated>
                    <div className="flex gap-2 items-center bg-white/50 backdrop-blur-sm border border-white/20 p-2 rounded-lg">
                        <Link href="/dashboard/new-link" className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:from-blue-00 hover:to-purple-700 transition-all duration-200">
                            <Plus className="w-4 h-4" />
                            Add Link
                        </Link>
                        <Button
                            asChild
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:border-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-200">
                            <Link href="/dashboard/billing">Billing</Link>
                        </Button>

                        <UserButton />
                    </div>
                </Authenticated>

                <Unauthenticated>
                    <SignInButton mode="modal">
                        <Button
                            variant="outline"
                            className='border-purple-600 text-purple-600 hover:border-purple-700 hover:bg-purple-600 hover:text-white transitin-all duration-200'>
                            Get Started for Free
                        </Button>

                    </SignInButton>
                </Unauthenticated>
            </div>
        </header>
    )
}

export default Header