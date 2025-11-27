import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`card ${className}`}>
            {title && <h3 style={{ marginBottom: '1rem' }}>{title}</h3>}
            {children}
        </div>
    );
};
