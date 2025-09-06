/**
 * Similar Ideas Component
 * 
 * Purpose: Display similar ideas with ML-powered recommendations
 * Features: Interactive cards, filtering, detailed view, actions
 */

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  ExternalLink, 
  BookmarkPlus,
  RefreshCw,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react'
import { useSimilarIdeas } from '../hooks/useSimilarIdeas'
import { useUserData } from '../hooks/useUserData'

// Simple UI components (replace with your actual UI library)
const Card = ({ children, className = '', onClick }: any) => (
  <div className={`border rounded-lg shadow-sm ${className}`} onClick={onClick}>
    {children}
  </div>
)

const CardHeader = ({ children }: any) => (
  <div className="p-4 pb-2">{children}</div>
)

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`font-semibold ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
)

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-4 pt-2 ${className}`}>{children}</div>
)

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800'
  }
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Button = ({ children, variant = 'default', size = 'default', onClick, disabled, className = '' }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors'
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50'
  }
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const Input = ({ placeholder, value, onChange, onKeyPress, className = '' }: any) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

const Skeleton = ({ className = '' }: any) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
)

const Alert = ({ children, variant = 'default' }: any) => {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  }
  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]}`}>
      {children}
    </div>
  )
}

const AlertDescription = ({ children }: any) => (
  <div className="text-sm">{children}</div>
)

// Toast function (replace with your actual toast implementation)
const toast = {
  error: (message: string) => console.error(message),
  success: (message: string) => console.log(message)
}

export interface SimilarIdea {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  popularity_score: number
  similarity: number
}

interface SimilarIdeasProps {
  userIdeaId?: string
  queryText?: string
  category?: string
  threshold?: number
  limit?: number
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

export const SimilarIdeas: React.FC<SimilarIdeasProps> = ({
  userIdeaId,
  queryText: initialQueryText,
  category,
  threshold = 0.7,
  limit = 8,
  showSearch = true,
  showFilters = true,
  className = ''
}) => {
  const [queryText, setQueryText] = useState(initialQueryText || '')
  const [selectedCategory, setSelectedCategory] = useState(category || '')
  const [similarityThreshold, setSimilarityThreshold] = useState(threshold)
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)

  const {
    similarIdeas,
    loading,
    error,
    searchMetrics,
    findSimilarIdeasForUserIdea,
    findSimilarIdeasForText,
    clearSimilarIdeas
  } = useSimilarIdeas()

  const { user, createIdea } = useUserData()

  // Load similar ideas on mount or when props change
  useEffect(() => {
    if (userIdeaId) {
      findSimilarIdeasForUserIdea(userIdeaId, { threshold: similarityThreshold, limit })
    } else if (initialQueryText) {
      findSimilarIdeasForText(initialQueryText, { 
        threshold: similarityThreshold, 
        limit, 
        category: selectedCategory 
      })
    }
  }, [userIdeaId, initialQueryText, similarityThreshold, limit, selectedCategory])

  // Handle search
  const handleSearch = async () => {
    if (!queryText.trim()) {
      toast.error('Please enter a search query')
      return
    }

    await findSimilarIdeasForText(queryText, {
      threshold: similarityThreshold,
      limit,
      category: selectedCategory
    })
  }

  // Handle refresh
  const handleRefresh = async () => {
    if (userIdeaId) {
      await findSimilarIdeasForUserIdea(userIdeaId, { 
        threshold: similarityThreshold, 
        limit, 
        forceRefresh: true 
      })
    } else if (queryText) {
      await handleSearch()
    }
  }

  // Save idea to user's collection
  const handleSaveIdea = async (idea: SimilarIdea) => {
    if (!user) {
      toast.error('Please sign in to save ideas')
      return
    }

    const success = await createIdea({
      title: `Inspired by: ${idea.title}`,
      description: idea.description,
      category: idea.category,
      tags: idea.tags,
      status: 'draft'
    })

    if (success) {
      toast.success('Idea saved to your collection!')
    }
  }

  // Get similarity color
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-500'
    if (similarity >= 0.8) return 'bg-blue-500'
    if (similarity >= 0.7) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  // Get similarity label
  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.9) return 'Excellent Match'
    if (similarity >= 0.8) return 'Good Match'
    if (similarity >= 0.7) return 'Fair Match'
    return 'Weak Match'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Similar Ideas</h2>
          {searchMetrics && (
            <Badge variant="outline">
              {searchMetrics.totalFound} found in {searchMetrics.searchTime}ms
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearSimilarIdeas}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              {showSearch && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for similar ideas..."
                      value={queryText}
                      onChange={(e: any) => setQueryText(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading}>
                    Search
                  </Button>
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Similarity:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.1"
                      value={similarityThreshold}
                      onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm font-mono">
                      {(similarityThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && similarIdeas.length > 0 && (
        <>
          {/* Metrics */}
          {searchMetrics && (
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Avg Similarity: {(searchMetrics.averageSimilarity * 100).toFixed(1)}%
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Search Time: {searchMetrics.searchTime}ms
              </div>
            </div>
          )}

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarIdeas.map((idea) => (
              <Card 
                key={idea.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {idea.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{idea.category}</Badge>
                        <div className="flex items-center gap-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${getSimilarityColor(idea.similarity)}`}
                          />
                          <span className="text-xs">
                            {getSimilarityLabel(idea.similarity)}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {idea.popularity_score}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className={`text-sm text-gray-600 ${
                    expandedIdea === idea.id ? '' : 'line-clamp-3'
                  }`}>
                    {idea.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {idea.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{idea.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      {(idea.similarity * 100).toFixed(1)}% match
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e: any) => {
                          e.stopPropagation()
                          handleSaveIdea(idea)
                        }}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e: any) => {
                          e.stopPropagation()
                          window.open(`/ideas/${idea.id}`, '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && similarIdeas.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Similar Ideas Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or lowering the similarity threshold.
            </p>
            <Button variant="outline" onClick={() => setSimilarityThreshold(0.5)}>
              Lower Similarity Threshold
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SimilarIdeas
