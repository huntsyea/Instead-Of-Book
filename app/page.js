"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen } from "lucide-react"
import Link from 'next/link'

export default function Home() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (hasSearched) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 300) // Match this with the CSS transition time
      return () => clearTimeout(timer)
    }
  }, [hasSearched])

  const searchBooks = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=9`)
      const data = await response.json()
      
      const uniqueTitles = {}
      const processedBooks = data.items ? data.items.reduce((acc, book) => {
        const title = book.volumeInfo.title
        if (!uniqueTitles[title] && acc.length < 9) {
          uniqueTitles[title] = true
          acc.push({
            id: book.id,
            title: title,
            authors: book.volumeInfo.authors || ['Unknown Author'],
            thumbnail: book.volumeInfo.imageLinks?.thumbnail,
            isbn: book.volumeInfo.industryIdentifiers?.find(
              identifier => identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10'
            )?.identifier
          })
        }
        return acc
      }, []) : []
      
      setBooks(processedBooks)
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks()
    }
  }

  return (
    <div className={`min-h-screen ${!hasSearched ? 'flex flex-col justify-center' : ''}`}>
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${isTransitioning ? 'transform -translate-y-1/3' : ''}`}>
        <h1 className={`text-3xl font-bold text-center mb-8 ${hasSearched ? 'text-2xl mb-4' : ''}`}>Instead of ________</h1>
        <div className={`max-w-xl mx-auto mb-8 ${hasSearched ? 'mb-4' : ''}`}>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search for books..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow"
            />
            <Button onClick={searchBooks} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </div>

        {hasSearched && books.length === 0 && !loading && (
          <p className="text-center text-gray-600">No books found. Try a different search term.</p>
        )}

        {hasSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link href={`/book/${book.id}`} key={book.id}>
                <div className="border rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition duration-200 h-full flex flex-col">
                  <div className="flex-grow flex items-center justify-center mb-4">
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-32 h-48 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-48 bg-gray-200 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-lg mb-2 line-clamp-2">{book.title}</h2>
                    <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                      {book.authors.join(', ')}
                    </p>
                    {book.isbn && <p className="text-xs text-gray-400">ISBN: {book.isbn}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}