import React from 'react';
import {cleanup, render} from '@testing-library/react';
import SubtitleModal from "./SubtitleModal";

afterEach(cleanup);

jest.mock('../../index', () => ({
    get apiService() {
        return true // set some default value
    }
}))

it("renders without crashing when closed", () => {
    const {baseElement} = render(<SubtitleModal  setModal={() => {}}  setSubtitleParent={() => {}} showModal={false}/>);
    expect(baseElement).toBeDefined();
});

it("renders without crashing when open", () => {
    const {baseElement} = render(<SubtitleModal  setModal={() => {}}  setSubtitleParent={() => {}} showModal={true}/>);
  expect(baseElement).toBeDefined();
  expect(baseElement.querySelector("[id=subtitle-modal]")).toBeDefined()
});

