#!/usr/bin/env -S gjs -m
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk?version=4.0';
import{menu}from'./menu.mjs';

const
td=new TextDecoder,
shell=w=>new Promise(f=>Gio.MemoryOutputStream.new_resizable().splice_async(
	Gio.Subprocess.new(w.split(' '),Gio.SubprocessFlags.STDOUT_PIPE).get_stdout_pipe(),
	Gio.OutputStreamSpliceFlags.CLOSE_TARGET,
	GLib.PRIORITY_DEFAULT,
	null,
	(w,x)=>(w.splice_finish(x),f(w.steal_as_bytes().get_data()))
));

print(
	await new Promise(async f=>menu({
		title:'clipboard...',
		items:await Promise.all(td.decode(await shell('cliphist list')).split('\n').map(async x=>x&&(
			x=x.match(/^(?<i>\d+)\s+(?<x>.*)$/s).groups,
			await(async m=>m?
				// null
				{
					exec:_=>f(x.i),
					keywords:{1:[x.x]},
					picture:Gdk.Texture.new_from_bytes(await shell(`cliphist decode ${x.i}`))
				}
				:
				// null
				{
					exec:_=>f(x.i),
					keywords:{1:[x.x]},
					txt:x.x
				}
			)(x.x.match(/^\[\[ binary data \d+ ([KMG]i)?B .+ \d+x\d+ ?\]\]$/))
		)))
	}))+'\t'
)
