import useWebSocket from 'react-use-websocket';
import styled from 'styled-components';
import Logo from "./images/LW-InteractIVE_BLK-BG_LOGO.png";
const ADMIN_WS_URL = 'ws://IP-ADDRESS/api/profile';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: black;
  color: white;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Header = styled.h1`

`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.label`
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 5px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 5px 10px;
  margin-top: 10px;
`;
const LogoImage = styled.img`
width: 200px;
height: 100px;
position: relative;
`;
function Profile() {
  const handleIncomingMessage = (message) => {
    console.log('Received message:', message);
    const data = JSON.parse(message.data);
    console.log('Parsed message:', data);
    if (data.type === 'redirect') {
      window.location.href = data.url;
    }
    // Handle the incoming message here
    if (message.data.type === 'redirect') {
      window.location.href = message.data.url;
    }
  };

  const { sendJsonMessage } = useWebSocket(ADMIN_WS_URL, {
    onMessage: handleIncomingMessage,
  });

  const setProfile = (event) => {
    console.log('setting profile');
    event.preventDefault();
    let memberName = event.target.elements.memberName.value;
    console.log('member name: ', memberName);
    if(!memberName) {memberName = 'Anonymous'}
    sendJsonMessage({ type: 'setProfile', profile: { name: memberName } });
  };

  return (
    <AppContainer>
      <MainContainer>
      <LogoImage src={Logo} alt="Logo"/>
        <FormContainer onSubmit={setProfile}>
          <Label>Enter your name to start interacting!</Label>
          <Input type="text" name="memberName" />
          <Button type="submit">Go</Button>
        </FormContainer>
      </MainContainer>
    </AppContainer>
  );
}

export default Profile;