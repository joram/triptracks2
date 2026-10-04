import {Container, Dropdown, Header, Icon, Image, Menu} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import {useContext} from "react";
import {UserContext} from "../App";
import Gravatar from "react-gravatar";
import {LoginButton} from "./login";

function userName(user) {
    return user.google_userinfo?.name ?? user.name ?? user.email ?? "Account";
}

function userEmail(user) {
    return user.google_userinfo?.email ?? user.email;
}

function userPicture(user) {
    return user.google_userinfo?.picture ?? user.picture ?? null;
}

function UserAvatar({user, size = 24}) {
    const picture = userPicture(user);
    const email = userEmail(user);
    if (picture) {
        return <Image avatar src={picture} style={{marginRight: "0.45em"}} />;
    }
    if (email) {
        return (
            <Gravatar
                email={email}
                size={size}
                style={{borderRadius: "50%", marginRight: "0.45em", verticalAlign: "middle"}}
                default="mp"
            />
        );
    }
    return <Icon name="user" style={{marginRight: "0.35em"}} />;
}

const TopNav = ({ fixed}) => {
    const { user, setUser, accessToken, setAccessToken } = useContext(UserContext);

    let loginInOrOut = <Menu.Item>
        <LoginButton />
    </Menu.Item>;
    if (user !== null && user !== undefined && accessToken !== null && accessToken !== undefined){
        loginInOrOut = <Dropdown
            pointing
            className="link item"
            trigger={
                <span style={{display: "inline-flex", alignItems: "center"}}>
                    <UserAvatar user={user} />
                    {userName(user)}
                </span>
            }
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
