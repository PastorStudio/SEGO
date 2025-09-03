
'use client'

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { services as initialServices, type ServiceCategory, type ServiceItem } from "@/lib/services";
import { Input } from "@/components/ui/input";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceCategory[]>(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const handlePriceClick = (item: ServiceItem) => {
    setEditingId(item.name);
    setTempPrice(item.price.toString());
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPrice(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, categoryIndex: number, itemIndex: number) => {
    if (e.key === 'Enter') {
      const newPrice = parseFloat(tempPrice);
      if (!isNaN(newPrice)) {
        const updatedServices = [...services];
        updatedServices[categoryIndex].items[itemIndex].price = newPrice;
        setServices(updatedServices);
      }
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };
  
  const handleBlur = (categoryIndex: number, itemIndex: number) => {
    const newPrice = parseFloat(tempPrice);
      if (!isNaN(newPrice)) {
        const updatedServices = [...services];
        updatedServices[categoryIndex].items[itemIndex].price = newPrice;
        setServices(updatedServices);
      }
    setEditingId(null);
  }

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);


  return (
    <>
      <PageHeader title="Nuestros Servicios" />
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Servicios</CardTitle>
          <CardDescription>
            Explora todos los servicios que ofrecemos para hacer de tu evento una experiencia inolvidable. Haz clic en un precio para editarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {services.map((category, categoryIndex) => (
              <AccordionItem value={category.category} key={category.category}>
                <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {category.items.map((item, itemIndex) => (
                      <Card key={itemIndex} className="flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-base">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                           <div className="text-lg font-semibold text-primary text-right">
                            {editingId === item.name ? (
                               <Input
                                  ref={inputRef}
                                  type="text"
                                  value={tempPrice}
                                  onChange={handlePriceChange}
                                  onKeyDown={(e) => handleKeyDown(e, categoryIndex, itemIndex)}
                                  onBlur={() => handleBlur(categoryIndex, itemIndex)}
                                  className="text-right"
                                />
                            ) : (
                               <p onClick={() => handlePriceClick(item)} className="cursor-pointer">
                                {formatCurrency(item.price)}
                               </p>
                            )}
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
