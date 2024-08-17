import React, { useState, Fragment } from 'react';
import Wheel from '@uiw/react-color-wheel';
import { hsvaToHex } from '@uiw/color-convert';
import { hsvaToName } from './colours';
import { useEffect } from 'react';


function Demo() {
  const [hsva, setHsva] = useState({ h: 214, s: 43, v: 90, a: 1 });
  const [name, setName] = useState("");

  useEffect(() => {
    setName(hsvaToName(hsvaToHex(hsva)))
  }, [hsva])

  return (
    <Fragment>
      <Wheel color={hsva} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />
      <div style={{ width: '100%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div>
    {name}
    </Fragment>
  );
}

export default Demo;