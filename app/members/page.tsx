"use client"

import { TopBar } from "@/components/top-bar"
import MemberList from "@/components/members/Member-list"
import MemberFilter from "@/components/members/Member-filter"
import MemberTitle from "@/components/members/Member-title"
import MemberContextProvider from "@/components/members/member-context-provider"

export default function MembersPage() {
  return (
    <MemberContextProvider>
      <div className="flex flex-col h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <MemberTitle></MemberTitle>
            <MemberFilter></MemberFilter>
            <MemberList></MemberList>
          </div>
        </main>
      </div>
    </MemberContextProvider>
  )
}
