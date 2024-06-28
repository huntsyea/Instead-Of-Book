"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Calendar } from "lucide-react"

function capitalizeTitle(title) {
  const lowercaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of']
  return title.split(' ').map((word, index) => {
    if (index === 0 || !lowercaseWords.includes(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
    return word.toLowerCase()
  }).join(' ')
}

function sanitizeHtml(html) {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
             .replace(/on\w+="[^"]*"/g, '');
}

function processCategories(categories) {
  if (!categories) return [];
  
  const processedCategories = categories.map(category => {
    if (category.includes('/')) {
      return capitalizeTitle(category.split('/')[0].trim())
    }
    return capitalizeTitle(category)
  });
  
  // Remove duplicates
  const uniqueCategories = [...new Set(processedCategories)];
  
  // Limit to 3 categories
  return uniqueCategories.slice(0, 3);
}

export default function BookPage() {
  const { id } = useParams()
  const [bookData, setBookData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
        const data = await response.json()
        if (data.volumeInfo) {
          const processedBookData = {
            title: capitalizeTitle(data.volumeInfo.title),
            subtitle: data.volumeInfo.subtitle ? capitalizeTitle(data.volumeInfo.subtitle) : null,
            authors: data.volumeInfo.authors || ['Unknown Author'],
            publishDate: data.volumeInfo.publishedDate,
            categories: processCategories(data.volumeInfo.categories),
            coverUrl: data.volumeInfo.imageLinks?.thumbnail,
            description: data.volumeInfo.description || null,
            pageCount: data.volumeInfo.pageCount,
            isbn: data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                  data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier
          }
          setBookData(processedBookData)
        }
      } catch (error) {
        console.error('Error fetching book data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookData()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!bookData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Link href="/">
          <Button>Back to Search</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button className="mb-8">
          <BookOpen className="mr-2 h-4 w-4" /> Back to Search
        </Button>
      </Link>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="md:flex p-8">
          <div className="md:w-1/4 flex justify-center">
            {bookData.coverUrl ? (
              <img
                src={bookData.coverUrl}
                alt={bookData.title}
                className="w-32 h-auto object-contain shadow-lg rounded"
              />
            ) : (
              <div className="w-32 h-48 bg-gray-200 flex items-center justify-center rounded shadow-lg">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="md:w-3/4 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {bookData.title}
            </h1>
            {bookData.subtitle && (
              <p className="mt-2 text-xl text-gray-600">{bookData.subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600">
              <p className="mr-4">By {bookData.authors.join(', ')}</p>
              {bookData.pageCount && <p className="mr-4">Pages: {bookData.pageCount}</p>}
              {bookData.isbn && <p>ISBN: {bookData.isbn}</p>}
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Published: {bookData.publishDate || 'Unknown'}</span>
            </div>
            {bookData.categories && bookData.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap">
                {bookData.categories.map((category, index) => (
                  <span key={index} className="mr-2 mb-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-8 py-6 border-t border-gray-200">
          {bookData.description && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Description</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(bookData.description) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}