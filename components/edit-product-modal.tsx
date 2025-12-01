import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Product {
    id: string;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    variantes: {
        id: string;
        precio: number;
        costo: number;
        codigoBarras?: string;
    }[];
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
}

export function EditProductModal({ isOpen, onClose, product, onSuccess }: EditProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        costo: '',
        codigoBarras: '',
        imagenUrl: '',
    });

    useEffect(() => {
        if (product) {
            const mainVariant = product.variantes?.[0] || {};
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: mainVariant.precio?.toString() || '0',
                costo: mainVariant.costo?.toString() || '0',
                codigoBarras: mainVariant.codigoBarras || '',
                imagenUrl: product.imagenUrl || '',
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: parseFloat(formData.precio),
                costo: parseFloat(formData.costo),
                codigoBarras: formData.codigoBarras,
                imagenUrl: formData.imagenUrl,
            };

            await api.patch(`/catalogo/productos/${product.id}`, payload);
            toast.success('Producto actualizado correctamente');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Error al actualizar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre del Producto</Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="precio">Precio Venta</Label>
                            <Input
                                id="precio"
                                name="precio"
                                type="number"
                                step="0.01"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costo">Costo</Label>
                            <Input
                                id="costo"
                                name="costo"
                                type="number"
                                step="0.01"
                                value={formData.costo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="codigoBarras">Código de Barras</Label>
                        <Input
                            id="codigoBarras"
                            name="codigoBarras"
                            value={formData.codigoBarras}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imagenUrl">URL de Imagen</Label>
                        <Input
                            id="imagenUrl"
                            name="imagenUrl"
                            value={formData.imagenUrl}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#159A9C] hover:bg-[#159A9C]/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
