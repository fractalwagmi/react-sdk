import { css } from '@emotion/css';

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 522.5 520.1"
      width="1rem"
    >
      <path
        className={css(`
          fill: #f2059f;
        `)}
        d="M74.9,520.1V0h372.8v112.7h-234v115.6h182V341h-182v179.1H74.9z"
      />
    </svg>
  );
};
