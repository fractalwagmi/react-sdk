import { css } from '@emotion/css';
import * as CSS from 'csstype';

interface Parameters {
  buttonBackground: CSS.Property.BackgroundColor;
  buttonBackgroundOnHover: CSS.Property.BackgroundColor;
  textColor: CSS.Property.Color;
}

export const getDefaultButtonStyles = ({
  buttonBackground,
  buttonBackgroundOnHover,
  textColor,
}: Parameters) =>
  css(`
    align-items: center;
    background: ${buttonBackground};
    border-radius: 0.25rem;
    border: 0;
    color: ${textColor};
    cursor: pointer;
    display: flex;
    font-family: "Quattrocento Sans", sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.02857em;
    padding: 0.1875rem;
    text-transform: uppercase;
    width: max-content;

    &:hover {
      background: ${buttonBackgroundOnHover};
    }
  `);
