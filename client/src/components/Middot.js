import styled from 'styled-components';

const Middot = styled.span`
	& + &:before {
		content: " \00b7  ";
	}
`
export default Middot
