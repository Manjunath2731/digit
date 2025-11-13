declare module '@egovernments/digit-ui-react-components' {
  import { ReactNode } from 'react';

  export interface TableProps {
    t: (key: string) => string;
    data: any[];
    columns: any[];
    getCellProps?: (cellInfo: any) => any;
    onSort?: (args: any) => void;
    disableSort?: boolean;
    sortParams?: object;
    manualPagination?: boolean;
    totalRecords?: number;
    currentPage?: number;
    onNextPage?: () => void;
    onPrevPage?: () => void;
    pageSizeLimit?: number;
    onPageSizeChange?: (e: any) => void;
    globalSearch?: any;
    className?: string;
    autoSort?: boolean;
    customTableStyles?: any;
    tableStyle?: any;
    styles?: any;
    isPaginationRequired?: boolean;
    customPaginationStyles?: any;
    disableGlobalFilter?: boolean;
    initialSortBy?: any;
    onSearch?: (e: any) => void;
    onLastPage?: () => void;
    onFirstPage?: () => void;
    totalPages?: number;
    inboxStyles?: any;
    isLoading?: boolean;
    actionLabel?: string;
    actionButtonLabel?: string;
    actionOnClick?: () => void;
  }

  export const Table: React.FC<TableProps>;

  export interface CardProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }

  export const Card: React.FC<CardProps>;

  export interface StatusTableProps {
    data: any[];
    t: (key: string) => string;
  }

  export const StatusTable: React.FC<StatusTableProps>;

  export interface ActionBarProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export const ActionBar: React.FC<ActionBarProps>;
}
