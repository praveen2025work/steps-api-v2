import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { faqData } from '@/data/documentationData';

interface FAQSectionProps {
  searchQuery?: string;
}

export default function FAQSection({ searchQuery = '' }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredFAQs, setFilteredFAQs] = useState(faqData);
  const [localSearch, setLocalSearch] = useState('');

  // Filter FAQs based on search query (either from props or local state)
  useEffect(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    
    if (query === '') {
      setFilteredFAQs(activeCategory 
        ? faqData.filter(category => category.id === activeCategory)
        : faqData
      );
    } else {
      const filtered = faqData.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query)
        )
      })).filter(category => category.items.length > 0);
      
      setFilteredFAQs(filtered);
    }
  }, [searchQuery, localSearch, activeCategory]);

  const handleCategoryFilter = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search FAQs..."
            className="pl-8"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {faqData.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name}
            </Button>
          ))}
          {activeCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {filteredFAQs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No FAQs found matching your search criteria.</p>
        </div>
      ) : (
        filteredFAQs.map(category => (
          <div key={category.id} className="space-y-4">
            <h3 className="text-lg font-medium">{category.name}</h3>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, index) => (
                <AccordionItem key={index} value={`${category.id}-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))
      )}
    </div>
  );
}