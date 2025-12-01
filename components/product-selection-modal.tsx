import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
    id: string;
    nombre: string;
    variantes: {
        id: string;
        precio: number;
        codigoBarras?: string;
    }[];
}

interface ProductSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: any) => void;
}

export function ProductSelectionModal({ isOpen, onClose, onSelect }: ProductSelectionModalProps) {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async (searchQuery = '') => {
        setLoading(true);
        try {
            const endpoint = searchQuery
                ? `/catalogo/search?q=${encodeURIComponent(searchQuery)}`
                : '/catalogo';

            const data = await api.get(endpoint);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        // Debounce simple
        const timeoutId = setTimeout(() => fetchProducts(value), 300);
        return () => clearTimeout(timeoutId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Seleccionar Producto a Editar</DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre..."
                        value={query}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No se encontraron productos
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {products.map((product) => (
                                <Button
                                    key={product.id}
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 px-4 text-left"
                                    onClick={() => onSelect(product)}
                                >
                                    <Package className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium truncate">{product.nombre}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ${product.variantes?.[0]?.precio || 0}
                                            {product.variantes?.[0]?.codigoBarras && ` • ${product.variantes[0].codigoBarras}`}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
