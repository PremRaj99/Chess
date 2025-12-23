"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Crown, Zap, Users, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ChessMaster</span>
          </div>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Play Chess Online
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance">
            Master the Game of Strategy
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Challenge players worldwide in real-time chess matches. Sharpen your skills and dominate the board.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => router.push("/game")}>
              Join a Game
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Watch Matches
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 space-y-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Real-Time Play</h3>
            <p className="text-muted-foreground leading-relaxed">
              Experience lightning-fast gameplay with instant moves and zero lag.
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Global Players</h3>
            <p className="text-muted-foreground leading-relaxed">
              Match with opponents from around the world at any skill level.
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Track Progress</h3>
            <p className="text-muted-foreground leading-relaxed">
              Monitor every move and improve your strategy with detailed history.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-card to-secondary border-border">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Ready to Make Your Move?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of players competing in thrilling chess matches every day.
            </p>
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => router.push("/game")}>
              Start Playing Now
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">ChessMaster</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ChessMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
