import Link from 'next/link'
import Image from 'next/image'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 text-center">
          <Image
            src="/images/vespera-logo.png"
            alt="Vespera World"
            width={60}
            height={60}
            className="mx-auto mb-6"
          />
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Authentication Error
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Something went wrong during authentication. Please try again or contact support.
          </p>
          
          <Link
            href="/auth/login"
            className="btn-gold inline-block"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
