import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {url} from "../../utils/auth";
import {UserContext} from "../../App";
import {getPackingList} from "./utils";
import ItemSearch from "./ItemSearch";
import PackingItems from "./PackingItems";
import "./packing.css";

// HINTS:
// FOOD: On a typical day you will burn between 3,000 and 5,000 calories. Generally this amounts to about 1½ pounds of food. Your food weight distribution should optimally be around 55 to 65% carbohydrates, 15 to 20 % protein, and less than 25% fat.
// WEIGHT: max 20% body weight

const SAVE_DELAY_MS = 800;

const SAVE_MESSAGES = {
    saving: "Saving…",
    saved: "All changes saved",
    error: "Changes not saved. They'll be retried on your next edit.",
};

async function savePackingList(id, accessToken, name, contents) {
    const response = await fetch(url("/api/v0/packing_list/" + id), {
        method: "POST",
        headers: {"Content-Type": "application/json", "Access-Key": accessToken},
        body: JSON.stringify({name, contents}),
    });
    if (!response.ok) throw new Error(`save failed: ${response.status}`);
}

// Saves the list a moment after the owner stops editing, never on load.
function useAutosave(id, accessToken) {
    const [status, setStatus] = useState(null);
    const timer = useRef(null);
    const pending = useRef(null);

    const flush = useCallback(() => {
        clearTimeout(timer.current);
        if (!pending.current) return;
        const {name, contents} = pending.current;
        pending.current = null;
        setStatus("saving");
        savePackingList(id, accessToken, name, contents)
            .then(() => setStatus((s) => (pending.current ? s : "saved")))
            .catch(() => setStatus("error"));
    }, [id, accessToken]);

    const schedule = useCallback((name, contents) => {
        pending.current = {name, contents};
        clearTimeout(timer.current);
        timer.current = setTimeout(flush, SAVE_DELAY_MS);
    }, [flush]);

    useEffect(() => flush, [flush]); // save anything pending when leaving the page

    return {status, schedule};
}

function Packing() {
    const {user, accessToken} = useContext(UserContext);
    const {id} = useParams();
    const [list, setList] = useState(null);
    const [missing, setMissing] = useState(false);
    const {status, schedule} = useAutosave(id, accessToken);

    useEffect(() => {
        setList(null);
        setMissing(false);
        getPackingList(id)
            .then((packingList) => {
                if (!packingList || packingList.detail) {
                    setMissing(true);
                    return;
                }
                setList({
                    name: packingList.name || "",
                    contents: Array.isArray(packingList.contents) ? packingList.contents : [],
                    ownerId: packingList.ownerId,
                });
            })
            .catch(() => setMissing(true));
    }, [id]);

    if (missing) {
        return <div className="packing">
            <p className="packing-empty">This packing list doesn't exist. <Link to="/packing/list">See your packing lists</Link>.</p>
        </div>;
    }
    if (list === null) {
        return <div className="packing"><p className="packing-empty">Loading packing list…</p></div>;
    }

    const isOwner = Boolean(user && accessToken && user.id === list.ownerId);

    function edit(patch) {
        const next = {...list, ...patch};
        setList(next);
        schedule(next.name, next.contents);
    }

    return <div className="packing">
        <header className="packing-header">
            {isOwner
                ? <input
                    className="packing-title"
                    aria-label="Packing list name"
                    placeholder="Name this list"
                    value={list.name}
                    onChange={(e) => edit({name: e.target.value})}
                />
                : <h1 className="packing-title">{list.name || "Packing list"}</h1>}
            {isOwner && status && <p className={status === "error" ? "packing-status is-error" : "packing-status"} role="status">
                {SAVE_MESSAGES[status]}
            </p>}
        </header>

        {isOwner && <ItemSearch onAdd={(item) => edit({contents: [...list.contents, item]})}/>}

        <PackingItems
            items={list.contents}
            editable={isOwner}
            onChange={(contents) => edit({contents})}
        />
    </div>;
}

export default Packing;
