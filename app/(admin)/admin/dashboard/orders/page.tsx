'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, ArrowLeft } from 'lucide-react';
import { Button, Modal, Badge, LoadingSpinner, EmptyState, Select } from '@/components/admin/ui';
import { Order, OrderStatus } from '@/types/admin.types';
import { mockOrders, apiService } from '@/services/api.service';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [tempStatus, setTempStatus] = useState<OrderStatus>('pending');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await apiService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setTempStatus(order.status);
        setShowOrderDetails(true);
    };

    const handleBackToList = () => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
    };

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return;

        try {
            await apiService.updateOrderStatus(selectedOrder.id, tempStatus);
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: tempStatus } : o));
            setSelectedOrder({ ...selectedOrder, status: tempStatus });
            handleBackToList();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const orderCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className='mb-6'>
                <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">Order Management</h1>
                <p className=" text-admin-primary">Track and manage all your customer orders</p>
            </div>

            {showOrderDetails && selectedOrder ? (
                <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <button
                            onClick={handleBackToList}
                            className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back</span>
                        </button>
                        <h2 className="text-xl font-medium text-admin-primary">Order Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-admin-primary mb-3">Personal Information</h3>
                            <div className="flex flex-col gap-4 text-sm">
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Name</p>
                                    <p className="text-admin-primary font-medium">{selectedOrder.userName}</p>
                                </div>
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Email</p>
                                    <p className="text-admin-primary font-medium">{selectedOrder.userEmail}</p>
                                </div>
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Status</p>
                                    <p className={`px-3 py-1 rounded-lg flex items-center justify-center border-0 ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-admin-primary mb-3">Order Information</h3>
                            <div className="flex flex-col gap-4 text-sm bg-admin-primary/6 p-4">
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Order ID</p>
                                    <p className="text-admin-primary font-medium">{selectedOrder.id}</p>
                                </div>
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Order Date</p>
                                    <p className="text-admin-primary font-medium">{formatDateTime(selectedOrder.orderDate)}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-grey mb-1">Delivery Address</p>
                                    <p className="text-admin-primary font-medium">{selectedOrder.deliveryAddress}</p>
                                </div>
                                <div className='flex flex-row items-center justify-between'>
                                    <p className="text-grey mb-1">Payment Status</p>
                                    <p className="text-admin-primary font-medium">{selectedOrder.paymentStatus}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-admin-primary mb-3">Order Items</h3>
                            <div className="border border-accent-2 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-accent-1">
                                        <tr>
                                            <th className="text-left text-sm font-medium text-admin-primary px-4 py-3">Product</th>
                                            <th className="text-left text-sm font-medium text-admin-primary px-4 py-3">Category</th>
                                            <th className="text-left text-sm font-medium text-admin-primary px-4 py-3">Quantity</th>
                                            <th className="text-left text-sm font-medium text-admin-primary px-4 py-3">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index} className="border-t border-accent-2">
                                                <td className="px-4 py-3 text-sm text-admin-primary">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm text-admin-primary">
                                                    {item.category}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-admin-primary">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-admin-primary">
                                                    {formatCurrency(item.price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end gap-5 items-center mt-3">
                                <span className="text-sm text-admin-primary">Total Amount:</span>
                                <span className=" text-admin-primary">
                                    {formatCurrency(selectedOrder.totalAmount)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-admin-primary mb-3">Change Status</h3>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'processing', label: 'Processing' },
                                    { value: 'shipped', label: 'Shipped' },
                                    { value: 'delivered', label: 'Delivered' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ].map((status) => (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => setTempStatus(status.value as OrderStatus)}
                                        className={`px-6 py-2 rounded-md border transition-all ${tempStatus === status.value
                                            ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                                            : 'border-admin-primary/35 text-admin-primary'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center space-x-5 pt-5">
                            <Button type="button" variant="secondary" onClick={handleBackToList}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleUpdateOrder}>
                                Update Order
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-admin-primary/4 rounded-t-xl p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2 bg-white p-1">
                                {[
                                    { key: 'all', label: 'All Orders' },
                                    { key: 'pending', label: 'Pending' },
                                    { key: 'processing', label: 'Processing' },
                                    { key: 'shipped', label: 'Shipped' },
                                    { key: 'delivered', label: 'Delivered' },
                                    { key: 'cancelled', label: 'Cancelled' },
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setStatusFilter(filter.key as any)}
                                        className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${statusFilter === filter.key
                                            ? 'bg-admin-primary text-white'
                                            : 'bg-admin-primary/5 text-admin-primary'
                                            }`}
                                    >
                                        <span>{filter.label}</span>
                                        <span>
                                            ({orderCounts[filter.key as keyof typeof orderCounts]})
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <Button>
                                Export
                            </Button>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6'>
                        <div>
                            <h2 className="text-sm text-admin-primary/60 mb-1">Total Orders</h2>
                            <p className="text-2xl font-bold text-admin-primary">
                                {filteredOrders.length}
                            </p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                            <input
                                type="text"
                                placeholder="Search by Orders ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-100 lg:w-150"
                            />
                        </div>
                    </div>

                    <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
                        {filteredOrders.length === 0 ? (
                            <EmptyState
                                title="No orders found"
                                description="Try adjusting your filters or search criteria"
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-accent-1 border-b border-accent-2">
                                        <tr>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Order ID</th>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Products</th>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Category</th>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Amount</th>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Date</th>
                                            <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} onClick={() => handleViewOrder(order)} className="border-b border-accent-2 transition-colors bg-white cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <p className="text-admin-primary">{order.id}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-admin-primary">
                                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.from(new Set(order.items.map(item => item.category))).map(cat => (
                                                            <p className='text-admin-primary'>{cat}</p>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-admin-primary">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4 text-admin-primary">
                                                    {formatDate(order.orderDate)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`px-3 py-1 rounded-lg w-28 flex items-center justify-center border-0 ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}