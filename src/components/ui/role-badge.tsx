import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/hooks/useUserRole';
import { Shield, Briefcase, Code, Palette, Users } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const getIcon = () => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'project_manager': return <Briefcase className="h-3 w-3" />;
      case 'developer': return <Code className="h-3 w-3" />;
      case 'designer': return <Palette className="h-3 w-3" />;
      case 'team_member': return <Users className="h-3 w-3" />;
    }
  };

  const getVariant = () => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'project_manager': return 'default' as const;
      case 'developer': return 'secondary' as const;
      case 'designer': return 'outline' as const;
      case 'team_member': return 'outline' as const;
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Badge variant={getVariant()} className="gap-1">
      {showIcon && getIcon()}
      {formatRole(role)}
    </Badge>
  );
}
