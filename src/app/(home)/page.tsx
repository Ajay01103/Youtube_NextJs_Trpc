import Image from "next/image"

export default function Home() {
  return (
    <div>
      <Image
        height={50}
        width={50}
        src="logo.svg"
        alt="logo"
      />
      <p className="text-xl font-semibold tracking-tight">New Tube</p>
    </div>
  )
}
