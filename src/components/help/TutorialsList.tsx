import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, PlayCircle, BookOpen, ArrowRight, Filter } from 'lucide-react';
import { tutorialData } from '@/data/documentationData';
import { ScrollArea } from '@/components/ui/scroll-area';
import TutorialViewer from './TutorialViewer';

interface TutorialsListProps {
  searchQuery?: string;
}

export default function TutorialsList({ searchQuery = '' }: TutorialsListProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredTutorials, setFilteredTutorials] = useState(tutorialData);
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

  useEffect(() => {
    let filtered = [...tutorialData];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) || 
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    // Apply level filter
    if (selectedLevel) {
      filtered = filtered.filter(tutorial => tutorial.level === selectedLevel);
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(tutorial => 
        tutorial.categories.includes(selectedCategory)
      );
    }
    
    setFilteredTutorials(filtered);
  }, [searchQuery, selectedLevel, selectedCategory]);

  // Get unique categories from all tutorials
  const allCategories = Array.from(
    new Set(tutorialData.flatMap(tutorial => tutorial.categories))
  );

  const handleTutorialSelect = (tutorialId: string) => {
    setSelectedTutorial(tutorialId);
  };

  const handleBackToList = () => {
    setSelectedTutorial(null);
  };

  const selectedTutorialData = tutorialData.find(t => t.id === selectedTutorial);

  return (
    <div>
      {selectedTutorial ? (
        <TutorialViewer tutorial={selectedTutorialData!} onBack={handleBackToList} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="mr-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            {/* Level filter */}
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <Badge 
                  key={level} 
                  variant={selectedLevel === level ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
            
            {/* Category filter */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 py-2">
                {allCategories.map(category => (
                  <Badge 
                    key={category} 
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutorials.length > 0 ? (
              filteredTutorials.map(tutorial => (
                <Card key={tutorial.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {tutorial.thumbnailUrl ? (
                      <img 
                        src={tutorial.thumbnailUrl} 
                        alt={tutorial.title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/20">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">{tutorial.level}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{tutorial.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutorial.categories.map(category => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {tutorial.duration}
                    </div>
                    <Button onClick={() => handleTutorialSelect(tutorial.id)}>
                      Start
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No tutorials found matching your criteria.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedLevel(null);
                    setSelectedCategory(null);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}