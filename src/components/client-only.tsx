
'use client';

import React, { useState, useEffect } from 'react';

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}


type ClientDateProps = {
    value: string | number | Date;
    options?: Intl.DateTimeFormatOptions;
}

export function ClientDate({ value, options }: ClientDateProps) {
    const formatDate = (dateValue: string | number | Date) => {
        return new Intl.DateTimeFormat('es-DO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...options
        }).format(new Date(dateValue));
    }

    return (
        <ClientOnly fallback={<span>{formatDate(value)}</span>}>
            <span>{formatDate(value)}</span>
        </ClientOnly>
    )
}

type ClientNumberProps = {
    value: number;
    options?: Intl.NumberFormatOptions;
}

export function ClientNumber({ value, options }: ClientNumberProps) {
    const formatCurrency = (numberValue: number) => {
        return new Intl.NumberFormat('es-DO', { 
            style: 'currency', 
            currency: 'DOP',
            ...options
        }).format(numberValue);
    }

    return (
        <ClientOnly fallback={<span>{formatCurrency(value)}</span>}>
            <span>{formatCurrency(value)}</span>
        </ClientOnly>
    );
}
