import React from 'react';
import {cleanup, render} from '@testing-library/react';
import ConnectionError from "./ConnectionError";

afterEach(cleanup);


it("renders without crashing", () => {
    const {baseElement} = render(<ConnectionError/>);
    expect(baseElement).toBeDefined();
});