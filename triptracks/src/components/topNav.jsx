import {Container, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";

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
            </Container>
        </Menu>
    </Segment>
}


export default TopNav