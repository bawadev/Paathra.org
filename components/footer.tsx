'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Flower, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pb-6">
      <footer className="bg-gradient-to-br from-[var(--text-dark)] to-[var(--secondary-color)] text-white relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3C/svg%3E")`
          }}></div>
        </div>
      
      <div className="container-dana py-20 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="lotus-icon"></div>
              <span className="text-3xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                Dhaana
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              Connecting generous hearts with Buddhist monasteries to support 
              spiritual practice through food donations.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--primary-color)] text-white hover:text-[var(--text-dark)] transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--primary-color)] text-white hover:text-[var(--text-dark)] transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--primary-color)] text-white hover:text-[var(--text-dark)] transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[var(--primary-color)] flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Quick Links
            </h3>
            <nav className="space-y-4">
              <Link href="/monasteries" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Find Monasteries
              </Link>
              <Link href="/donate" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Make Donation
              </Link>
              <Link href="/my-donations" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                My Donations
              </Link>
              <Link href="/manage" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Manage Monastery
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[var(--primary-color)] flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Support
            </h3>
            <nav className="space-y-4">
              <Link href="/help" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Help Center
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Contact
              </Link>
              <Link href="/privacy" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors duration-300 text-lg">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[var(--primary-color)] flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Connect
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-[var(--primary-color)]" />
                <span className="text-lg">hello@dhaana.org</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-[var(--primary-color)]" />
                <span className="text-lg">+1 (555) 123-4567</span>
              </div>
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-sm text-gray-300 italic">
                  "Dana is not just giving, it's an expression of the heart's natural generosity."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-lg">
              © 2025 Dhaana. Made with{' '}
              <Heart className="w-4 h-4 inline text-[var(--accent-color)]" />
              {' '}for spiritual communities.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-[var(--primary-color)] transition-colors duration-300">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[var(--primary-color)] transition-colors duration-300">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-[var(--primary-color)] transition-colors duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}
