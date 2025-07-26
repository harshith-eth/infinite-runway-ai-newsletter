import React from 'react';

export const metadata = {
  title: 'Essays | Infinite Runway',
  description: 'Explore our collection of essays and insights on various topics.',
};

export default function EssaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <div 
        className="h-full overflow-auto hide-scrollbar"
        style={{
          overscrollBehavior: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
} 