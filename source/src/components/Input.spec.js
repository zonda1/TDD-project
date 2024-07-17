import {render} from '@testing-library/react';
import Input from './Input';

it('input has is-invalid class when component has help prop',()=>{
    const {container}=render(<Input help="Error message"/>);
    const input=container.querySelector('input');
    expect(input).toHaveClass('is-invalid');
})
it('span has invalid-feedback class when component has help prop',()=>{
    const {container}=render(<Input help="Error message"/>);
    const span=container.querySelector('span');
    expect(span).toHaveClass('invalid-feedback');
})

it('input does not have is-invalid class when component has no help prop',()=>{
    const {container}=render(<Input/>);
    const input=container.querySelector('input');
    expect(input).not.toHaveClass('is-invalid');
})