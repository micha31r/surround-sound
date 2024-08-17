import ClientAuthGuard from "@/components/ClientAuthGuard"

export default async function ClientAuthLayout({ children }) {
  return (
    <ClientAuthGuard>
      {children}
    </ClientAuthGuard>
  )
}