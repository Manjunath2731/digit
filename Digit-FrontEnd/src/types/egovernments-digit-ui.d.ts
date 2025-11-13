declare module '@egovernments/digit-ui-react-components' {
  import { ReactNode, FC } from 'react';

  // Table component
  export interface TableProps {
    t?: (key: string) => string;
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
    [key: string]: any;
  }

  export const Table: FC<TableProps>;

  // Card component
  export interface CardProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    [key: string]: any;
  }

  export const Card: FC<CardProps>;

  // StatusTable component
  export interface StatusTableProps {
    data: any[];
    t: (key: string) => string;
    [key: string]: any;
  }

  export const StatusTable: FC<StatusTableProps>;

  // ActionBar component
  export interface ActionBarProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export const ActionBar: FC<ActionBarProps>;
}
