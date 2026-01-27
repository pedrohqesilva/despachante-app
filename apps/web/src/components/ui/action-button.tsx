import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
    type?: 'submit' | 'button';
    disabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function ActionButton({
    type = 'submit',
    disabled = false,
    isLoading = false,
    loadingText = 'Gerando...',
    icon: Icon = Sparkles,
    children,
    onClick,
    className,
}: ActionButtonProps) {
    return (
        <Button
            type={type}
            disabled={disabled || isLoading}
            size="lg"
            onClick={onClick}
            className={cn(
                "w-full h-12 text-sm font-semibold rounded-lg transition-all duration-300",
                "bg-gradient-to-r from-action-gradient-start via-action-gradient-mid to-action-gradient-end",
                "hover:brightness-95",
                "text-action-foreground shadow-lg hover:shadow-xl hover:shadow-action-gradient-start/25",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-muted disabled:via-muted disabled:to-muted disabled:text-muted-foreground",
                className
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    {loadingText}
                </>
            ) : (
                <>
                    <Icon className="size-4 mr-2" />
                    {children}
                </>
            )}
        </Button>
    );
}
