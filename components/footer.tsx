'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Flower, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[var(--text-dark)] text-white">
      <div className="container-dana py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Flower className="w-8 h-8 text-[var(--primary-color)]" />
              <span className="text-2xl font-bold gradient-text">Dhaana</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Connecting generous hearts with Buddhist monasteries to support 
              spiritual practice through food donations.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-[var(--primary-color)]">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-[var(--primary-color)]">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-[var(--primary-color)]">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-color)]">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/monasteries" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                Find Monasteries
              </Link>
              <Link href="/donate" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                Make Donation
              </Link>
              <Link href="/my-donations" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                My Donations
              </Link>
              <Link href="/manage" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                Manage Monastery
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-color)]">Support</h3>
            <nav className="space-y-2">
              <Link href="/about" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                About Us
              </Link>
              <Link href="/how-it-works" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                How It Works
              </Link>
              <Link href="/faq" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-[var(--primary-color)] transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-color)]">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-[var(--primary-color)]" />
                <span className="text-sm">contact@dhaana.org</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4 text-[var(--primary-color)]" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin className="w-4 h-4 text-[var(--primary-color)] mt-0.5" />
                <span className="text-sm">123 Meditation Way<br />Peaceful Valley, CA 90210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <Heart className="w-4 h-4 text-[var(--accent-color)]" />
              <span>Made with compassion for the Buddhist community</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-300">
              <Link href="/privacy" className="hover:text-[var(--primary-color)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--primary-color)] transition-colors">
                Terms of Service
              </Link>
              <span>© 2025 Dhaana. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
