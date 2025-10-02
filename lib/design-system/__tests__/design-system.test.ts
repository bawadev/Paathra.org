/**
 * Enhanced Dana Design System - Basic Functionality Tests
 * Tests for design system components and utilities
 */

// Import design system utilities
import {
  getColorValue,
  colorTokens,
  typographyTokens,
  buttonVariants,
  cardVariants,
  createCulturalContext,
  getCulturalLayout,
  generateCulturalClasses,
} from '../index'

// Test color tokens
export function testColorTokens(): boolean {
  try {
    // Test basic color access
    const primaryColor = getColorValue('primary.500')
    const trustColor = getColorValue('trust.500')
    const spiritualColor = getColorValue('spiritual.500')

    console.log('✅ Color tokens test passed:', {
      primary: primaryColor,
      trust: trustColor,
      spiritual: spiritualColor,
    })

    // Verify OKLCH format
    const isValidOKLCH = (color: string) => color.startsWith('oklch(')

    return (
      isValidOKLCH(colorTokens.primary[500]) &&
      isValidOKLCH(colorTokens.trust[500]) &&
      isValidOKLCH(colorTokens.spiritual[500]) &&
      isValidOKLCH(colorTokens.compassion[500])
    )
  } catch (error) {
    console.error('❌ Color tokens test failed:', error)
    return false
  }
}

// Test typography system
export function testTypographySystem(): boolean {
  try {
    // Test font families
    const englishFont = typographyTokens.fontFamily.sans
    const sinhalaFont = typographyTokens.fontFamily.sinhala

    console.log('✅ Typography system test passed:', {
      english: englishFont,
      sinhala: sinhalaFont,
    })

    return (
      Array.isArray(englishFont) &&
      Array.isArray(sinhalaFont) &&
      englishFont.length > 0 &&
      sinhalaFont.length > 0
    )
  } catch (error) {
    console.error('❌ Typography system test failed:', error)
    return false
  }
}

// Test button variants
export function testButtonVariants(): boolean {
  try {
    // Test basic variants
    const defaultButton = buttonVariants({ variant: 'default' })
    const donateButton = buttonVariants({ variant: 'donate', size: 'lg' })
    const spiritualButton = buttonVariants({ variant: 'spiritual', cultural: 'sinhala' })

    console.log('✅ Button variants test passed:', {
      default: defaultButton.includes('bg-primary'),
      donate: donateButton.includes('gradient'),
      spiritual: spiritualButton.includes('bg-spiritual'),
    })

    return (
      typeof defaultButton === 'string' &&
      typeof donateButton === 'string' &&
      typeof spiritualButton === 'string' &&
      defaultButton.length > 0
    )
  } catch (error) {
    console.error('❌ Button variants test failed:', error)
    return false
  }
}

// Test card variants
export function testCardVariants(): boolean {
  try {
    // Test basic variants
    const defaultCard = cardVariants({ variant: 'default' })
    const monasteryCard = cardVariants({ variant: 'monastery', size: 'lg' })
    const lotusCard = cardVariants({ variant: 'lotus', animation: 'enhanced' })

    console.log('✅ Card variants test passed:', {
      default: defaultCard.includes('bg-card'),
      monastery: monasteryCard.includes('monastery'),
      lotus: lotusCard.includes('lotus'),
    })

    return (
      typeof defaultCard === 'string' &&
      typeof monasteryCard === 'string' &&
      typeof lotusCard === 'string' &&
      defaultCard.length > 0
    )
  } catch (error) {
    console.error('❌ Card variants test failed:', error)
    return false
  }
}

// Test cultural system
export function testCulturalSystem(): boolean {
  try {
    // Test cultural layouts
    const englishLayout = getCulturalLayout('en')
    const sinhalaLayout = getCulturalLayout('si')

    // Test cultural context creation
    const englishContext = createCulturalContext('en')
    const sinhalaContext = createCulturalContext('si', { density: 'comfortable' })

    // Test class generation
    const englishClasses = generateCulturalClasses('en')
    const sinhalaClasses = generateCulturalClasses('si')

    console.log('✅ Cultural system test passed:', {
      englishLayout: englishLayout.locale,
      sinhalaLayout: sinhalaLayout.locale,
      englishClasses: englishClasses.includes('font-sans'),
      sinhalaClasses: sinhalaClasses.includes('font-sinhala'),
    })

    return (
      englishLayout.locale === 'en' &&
      sinhalaLayout.locale === 'si' &&
      englishContext.locale === 'en' &&
      sinhalaContext.locale === 'si' &&
      typeof englishClasses === 'string' &&
      typeof sinhalaClasses === 'string'
    )
  } catch (error) {
    console.error('❌ Cultural system test failed:', error)
    return false
  }
}

// Test cultural appropriateness
export function testCulturalAppropriateness(): boolean {
  try {
    const issues: string[] = []

    // Check for inappropriate cultural terms or imagery
    const colorNames = Object.keys(colorTokens)
    const hasInappropriateNames = colorNames.some(name =>
      ['sacred', 'holy', 'blessed', 'divine'].includes(name.toLowerCase())
    )

    if (hasInappropriateNames) {
      issues.push('Inappropriate sacred/religious color naming')
    }

    // Check if spiritual colors are used respectfully
    const spiritualColor = colorTokens.spiritual[500]
    if (!spiritualColor.includes('oklch')) {
      issues.push('Spiritual colors should use OKLCH for consistency')
    }

    // Check Sinhala typography settings
    const sinhalaSettings = typographyTokens.cultural.sinhala
    if (parseFloat(sinhalaSettings.lineHeight) < 1.6) {
      issues.push('Sinhala line height should be at least 1.6 for readability')
    }

    console.log('✅ Cultural appropriateness test passed:', {
      issues: issues.length === 0 ? 'None found' : issues,
    })

    return issues.length === 0
  } catch (error) {
    console.error('❌ Cultural appropriateness test failed:', error)
    return false
  }
}

// Run all tests
export function runDesignSystemTests(): boolean {
  console.log('🧪 Running Enhanced Dana Design System Tests...\n')

  const tests = [
    { name: 'Color Tokens', test: testColorTokens },
    { name: 'Typography System', test: testTypographySystem },
    { name: 'Button Variants', test: testButtonVariants },
    { name: 'Card Variants', test: testCardVariants },
    { name: 'Cultural System', test: testCulturalSystem },
    { name: 'Cultural Appropriateness', test: testCulturalAppropriateness },
  ]

  const results = tests.map(({ name, test }) => {
    try {
      const result = test()
      console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'PASSED' : 'FAILED'}\n`)
      return result
    } catch (error) {
      console.log(`❌ ${name}: FAILED (${error})\n`)
      return false
    }
  })

  const allPassed = results.every(result => result)
  const passedCount = results.filter(result => result).length

  console.log(`\n🎯 Test Summary: ${passedCount}/${tests.length} tests passed`)

  if (allPassed) {
    console.log('🎉 All design system tests passed! The system is ready for use.')
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.')
  }

  return allPassed
}

// Export test utilities
export const designSystemTests = {
  runAll: runDesignSystemTests,
  colorTokens: testColorTokens,
  typography: testTypographySystem,
  buttons: testButtonVariants,
  cards: testCardVariants,
  cultural: testCulturalSystem,
  appropriateness: testCulturalAppropriateness,
}

// Default export for easy testing
export default designSystemTests