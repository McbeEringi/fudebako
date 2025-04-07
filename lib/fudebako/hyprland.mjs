#!/usr/bin/env -S gjs -m
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';


const
td=new TextDecoder,
hypr_cd=`${GLib.getenv('XDG_RUNTIME_DIR')}/hypr/${GLib.getenv('HYPRLAND_INSTANCE_SIGNATURE')}`,
hypr_r=w=>(s=>
	s.connect(Gio.UnixSocketAddress.new(`${hypr_cd}/.socket2.sock`),null)&&
	Object.assign(s,{
		read:_=>new Promise(f=>s.input_stream.read_bytes_async(
			1024,GLib.PRIORITY_DEFAULT,null,(_,x)=>f(
				td.decode(s.input_stream.read_bytes_finish(x))
			)
		))
	})
)(new Gio.SocketConnection({
	socket:Gio.Socket.new(
		Gio.SocketFamily.UNIX,
		Gio.SocketType.STREAM,
		Gio.SocketProtocol.DEFAULT
	)
})),
hypr_w=w=>(s=>
	s.connect(Gio.UnixSocketAddress.new(`${hypr_cd}/.socket.sock`),null)&&
	~s.output_stream.write(w,null)&&
	td.decode(s.input_stream.read_bytes(8192,null),s.close(null))
)(new Gio.SocketConnection({
	socket:Gio.Socket.new(
		Gio.SocketFamily.UNIX,
		Gio.SocketType.STREAM,
		Gio.SocketProtocol.DEFAULT
	)
}));

console.log(
hypr_w(`notify 5 3000 0 hello from IPC!`)
);

console.log(1);
new Promise(async _=>{
const r=hypr_r();
while(1)console.log(await r.read());
});
console.log(1);
await new Promise(_=>_);
// while(1)console.log(
// 	[...td.decode(
// 		hypr_r.read_bytes(1024, null)
// 	).matchAll(/(?<event>.+)>>(?<data>.+)\n/g)].map(x=>x.groups)
// );

export{hypr_w};
