package com.cfs.BMS.enums;

import com.cfs.BMS.entity.Seat;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public enum BookingStatus implements List<Seat> {
    CONFIRMED,
    CANCELLED;

    @Override
    public int size() {
        return 0;
    }

    @Override
    public boolean isEmpty() {
        return false;
    }

    @Override
    public boolean contains(Object o) {
        return false;
    }

    @Override
    public Iterator<Seat> iterator() {
        return null;
    }

    @Override
    public Object[] toArray() {
        return new Object[0];
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return null;
    }

    @Override
    public boolean add(Seat seat) {
        return false;
    }

    @Override
    public boolean remove(Object o) {
        return false;
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return false;
    }

    @Override
    public boolean addAll(Collection<? extends Seat> c) {
        return false;
    }

    @Override
    public boolean addAll(int index, Collection<? extends Seat> c) {
        return false;
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return false;
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return false;
    }

    @Override
    public void clear() {

    }

    @Override
    public Seat get(int index) {
        return null;
    }

    @Override
    public Seat set(int index, Seat element) {
        return null;
    }

    @Override
    public void add(int index, Seat element) {

    }

    @Override
    public Seat remove(int index) {
        return null;
    }

    @Override
    public int indexOf(Object o) {
        return 0;
    }

    @Override
    public int lastIndexOf(Object o) {
        return 0;
    }

    @Override
    public ListIterator<Seat> listIterator() {
        return null;
    }

    @Override
    public ListIterator<Seat> listIterator(int index) {
        return null;
    }

    @Override
    public List<Seat> subList(int fromIndex, int toIndex) {
        return List.of();
    }
}
