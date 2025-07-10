import * as React from "react"

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
> 