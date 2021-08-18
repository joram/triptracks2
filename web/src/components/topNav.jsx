import {Container, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import GoogleLogin from 'react-google-login';


const responseGoogle = (response) => {
    fetch("http://localhost:8000/api/v0/access_key", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: response.tokenId,
        client_id:"965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com",
      })
    }).then(response => response.json())
    .then(access_key => {
      console.log("Request complete! response:", access_key);
      fetch("http://localhost:8000/api/v0/packing_lists", {
          method: "GET",
          headers: {
              'Content-Type': 'application/json',
              'Access-Key': access_key,
          },
      }).then(response => response.json())
          .then(packing_lists => {
              console.log(packing_lists)
          })

    });
}


const TopNav = ({ fixed }) => {
    return <Segment
        inverted
        textAlign='center'
        style={{padding: '0em 0em'}}
        vertical
    >
        <Menu
            fixed={fixed ? 'top' : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size='large'
        >
            <Container>
                <Menu.Item style={{backgroundColor: "darkgreen"}}>
                    <Header inverted as='a' href="/">
                        <Image src="/icon.png"/>Triptracks
                    </Header>
                </Menu.Item>
                <Menu.Item as='a' active={window.location.pathname==="/trails/"} href="/trails/">Trails</Menu.Item>
                <Menu.Item as='a' active={window.location.pathname==="/packing/"} href="/packing/">Packing</Menu.Item>
                <Menu.Item position="right"><TrailsSearch/></Menu.Item>
                <GoogleLogin
                    clientId="965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                  />,
            </Container>
        </Menu>
    </Segment>
}


export default TopNav