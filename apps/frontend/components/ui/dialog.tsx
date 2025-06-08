import * as React from "react"

interface DialogProps {
open: boolean
onOpenChange: (open: boolean) => void
children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
return (
<div
className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}
onClick={(e) => {
if (e.target === e.currentTarget) {
onOpenChange(false)
}
}}
>
<div className="fixed inset-0 bg-black/50" />
<div className="fixed inset-0 flex items-center justify-center p-4">
<div className="bg-white rounded-lg p-6 max-w-md w-full">
{children}
</div>
</div>
</div>
)
}
