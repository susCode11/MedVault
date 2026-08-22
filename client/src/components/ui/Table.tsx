import React from 'react';
import clsx from 'clsx';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-surface-border">
    <table className={clsx("w-full text-left text-sm text-gray-300", className)} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={clsx("bg-surface-hover text-xs uppercase text-gray-400", className)} {...props}>
    {children}
  </thead>
);

export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={clsx("divide-y divide-surface-border bg-surface-card", className)} {...props}>
    {children}
  </tbody>
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={clsx("hover:bg-surface-hover/50 transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={clsx("px-6 py-4 font-medium", className)} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className={clsx("px-6 py-4 whitespace-nowrap", className)} {...props}>
    {children}
  </td>
);
