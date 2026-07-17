import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@equalsite/ui';
import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { BreadcrumbItem, NavItem } from '@/types';

export function NavMain({
    items = [],
    breadcrumbs = [],
}: {
    items: NavItem[];
    breadcrumbs?: BreadcrumbItem[];
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    // A page's breadcrumb trail says which section it belongs to more
    // reliably than its URL prefix does — e.g. `/audit/{id}` reached via a
    // site's history is rooted at "Sites", not "Audits". Fall back to
    // URL-prefix matching for pages that don't set breadcrumbs.
    const rootHref = breadcrumbs[0]?.href;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={
                                rootHref
                                    ? toUrl(rootHref) === toUrl(item.href)
                                    : isCurrentOrParentUrl(item.href)
                            }
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
