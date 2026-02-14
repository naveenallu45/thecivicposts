import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - The Civic Posts',
  description: 'Get in touch with The Civic Posts. Send us a message and we will respond as soon as possible.',
}

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
