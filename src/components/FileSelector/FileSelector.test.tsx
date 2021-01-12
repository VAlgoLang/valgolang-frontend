import React from 'react';
import {cleanup, render} from '@testing-library/react';
import FileSelector from "./FileSelector";

afterEach(cleanup);

test('renders without crashing', () => {
    let {baseElement} = render(<FileSelector onChange={() => {}} directory={true} name={"test"}/>);
    expect(baseElement).toBeDefined();
});

test('callback not called without file upload', () => {
    const onChange = jest.fn();
    let {getByTestId} = render(<FileSelector onChange={onChange} directory={true} name={"test"}/>);
    getByTestId("upload-button").click();
    expect(onChange).toBeCalledTimes(0);
});

