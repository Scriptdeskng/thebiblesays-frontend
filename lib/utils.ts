export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    delivered: 'text-[#2AA31F] bg-[#2AA31F]/7',
    completed: 'text-[#2AA31F] bg-[#2AA31F]/7',
    pending: 'text-[#626262] bg-[#626262]/7',
    placed: 'text-[#626262] bg-[#626262]/7',
    payment_confirmed: 'text-blue-600 bg-blue-50',
    processing: 'text-orange-600 bg-orange-50',
    shipped: 'text-[#3291FF] bg-[#3291FF]/7',
    out_for_delivery: 'text-[#3291FF] bg-[#3291FF]/7',
    cancelled: 'text-[#CA0F04] bg-[#CA0F04]/7',
    backordered: 'text-yellow-600 bg-yellow-50',
    failed: 'text-[#CA0F04] bg-[#CA0F04]/7',
    refunded: 'text-grey bg-accent-1',
    
    active: 'text-[#2AA31F] bg-[#2AA31F]/7',
    inactive: 'text-grey bg-accent-1',
    flagged: 'text-[#CA0F04] bg-[#CA0F04]/7',
    
    approved: 'text-[#2AA31F] bg-[#2AA31F]/7',
    rejected: 'text-[#CA0F04] bg-[#CA0F04]/7',
    
    expired: 'text-grey bg-accent-1',
    
    scheduled: 'text-[#626262] bg-[#626262]/7',
  };

  return statusColors[status.toLowerCase()] || 'text-grey bg-accent-1';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
