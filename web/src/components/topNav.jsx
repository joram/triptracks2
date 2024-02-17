import {Container, Dropdown, Header, Icon, Image, Menu} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import {useContext} from "react";
import {UserContext} from "../App";

const TopNav = ({ fixed}) => {
    const { user, setUser, accessToken, setAccessToken } = useContext(UserContext);

    let loginInOrOut = <Menu.Item
        active={window.location.pathname.startsWith("/login")}
        href="/login"
    >
        Sign in
    </Menu.Item>;
    if (user !== null && user !== undefined && accessToken !== null && accessToken !== undefined){
        let username = user.name
        loginInOrOut = <Dropdown
            active={window.location.pathname.startsWith("/login")}
            text={username}
            pointing className='link item'
        >
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => {
                    setUser(null)
                    setAccessToken(null)
                }}>
                    Logout
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>;
    }

    return <Menu
        fixed={'top'}
        inverted
    >
        <Container>
            <Menu id="left-menu-section" inverted={!fixed}>
                <Menu.Item
                    active={window.location.pathname==="/"}
                    position="left"
                >
                    <Header inverted href="/">
                        <Image src="/icon.png" size="tiny" />
                        Triptracks
                    </Header>
                </Menu.Item>
                <Menu.Item
                    active={window.location.pathname.startsWith("/trails")}
                    href="/trails"
                >
                    <Icon name="map signs"/>
                    Trails
                </Menu.Item>
                <Menu.Item
                    active={window.location.pathname.startsWith("/packing")}
                    href="/packing/list"
                >
                    <Icon name="calendar minus"/>
                    Packing
                </Menu.Item>
                <Menu.Item
                    active={window.location.pathname.startsWith("/partners")}
                    href="/partners"
                >
                    <Icon name="group"/>
                    Partners
                </Menu.Item>
                <Menu.Item
                    active={window.location.pathname.startsWith("/plan")}
                    href="/plans/list"
                >
                    <Icon name="calendar alternate outline"/>
                    Plans
                </Menu.Item>
            </Menu>
            <Menu.Item position="right">
                <TrailsSearch/>
            </Menu.Item>
            {loginInOrOut}
        </Container>
    </Menu>
}


export {TopNav}
