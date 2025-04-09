#!/usr/bin/env -S gjs -m
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import{menu}from'./menu.mjs';

menu({
	items:new Gio.DataInputStream({
		base_stream:new GioUnix.InputStream({fd:0}),
		close_base_stream:true
	}).read_upto('',0,null)[0].split('\n').map(x=>({
		txt:x,
		exec:_=>print(x),
		keywords:{1:[x]}
	}))
});
